---
title: Hackathon Part 1 - Out of Google Sheets and Into Atlas
author: Dachary Carey
layout: post
description: In which I free my data from Google Sheets.
date: 2023-11-01 12:00:00 -0400
url: /2023/11/01/hackathon-part-1/
image: /images/docs-analytics-google-sheet.png
tags: [Documentation, Coding, Hackathon]
---

One of my favorite things about working at MongoDB is that we do a hackathon once or twice a year. It's a one-week extravaganza where we can work on PoCs, improve tooling, build skills, or try interesting projects. Some of my teammates have even built things during hackathon that have made it into the product! It's great for making improvements and getting us to think creatively.

## My idea

I’ve been thinking about how we could use analytics data to make more informed project decisions. As individual docs contributors, we don’t have access to Google Analytics. We do have a massive Google Sheets abomination that gets updated weekly. It contains information about all the docs properties owned by the DevEd team.

That aggregate sheet gets links to a new Google Sheet every week that has the data for a given week. We have to do a lot of spreadsheet wrangling if we want to zoom in on a subset of our analytics for a specific SDK. It's a ton of work to compare changes over time - which crosses the boundaries of different Google Sheets. Here’s a snapshot of the weekly sheet:

![Screenshot of the DevEd Docs Weekly Analytics Google Sheet with a whole lotta URLs and many tabs for our docs properties](/images/docs-analytics-google-sheet.png)

I knew this data would be a lot easier to wrangle if I could get it into a [MongoDB Atlas Database](https://www.mongodb.com/atlas/database). By using Atlas, the data would already be in the cloud and accessible to the rest of my team. I would have the power of MongoDB aggregation to manipulate the data to get the info I want. And I could even use [MongoDB Charts](https://www.mongodb.com/products/charts) to build dashboards for our team using this data. They would be much better dashboards than I could get even if I had Google Analytics access. So I decided to make that my hackathon mission this time around.

But what was the best way to free my data from Google Sheets and get it into Atlas where I could wrangle it properly?

I consulted the oracle - my favorite search engine, [Kagi](https://kagi.com/). A handful of options came up. One was an article written by one of my co-workers, several years before I joined the company: [Stitching Sheets: Using MongoDB Stitch To Create An API For Data In Google Sheets](https://www.mongodb.com/blog/post/stitching-sheets-using-mongodb-stitch-to-create-an-api-for-data-in-google-sheets).

I knew we deprecated Stitch webhooks, replaced with Realm HTTP Endpoints which were now App Services Data API Endpoints. I decided to see if all the pieces from Michael’s article still worked together with the Data API Endpoints.

## Get data out of Google Sheets

I started by creating a [custom HTTPS Endpoint](https://www.mongodb.com/docs/atlas/app-services/data-api/custom-endpoints/) in App Services. I would need to call this endpoint from Google Sheets with the information I wanted to import. That part was easy-peasy.

I would need it to call an [App Services Function](https://www.mongodb.com/docs/atlas/app-services/functions/) to do some stuff with the data and then insert it into Atlas. So I created a placeholder function, but I wasn't ready to do anything with it yet. But now I had the pieces to start writing the [Google Apps Script](https://www.google.com/script/start/) that would get my data out of Google Sheets.

Michael provided a [GitHub Gist](https://gist.github.com/mrlynn/0e2904376cd9e893ae5cec7207e5bcee) for his Google Sheets script that was super easy to follow. I worked from his example to:

- Create an object that contains keys for each column in the spreadsheet.
- Add a menu item to Google Sheets when you open it. When you select the menu item, it kicks off the function that does the export.
- Write a function to send the data from the sheet to my API endpoint.

My version looks something like this:

![Screenshot of the Google Apps Script to export data to MongoDB built on the Gist linked above](/images/docs-analytics-google-apps-script.png)

Ok, now that I had these two pieces, I was ready to work on what to do with this data once I got it to Atlas.

## Interrupting to set up the data collection

It was around now that I realized I didn't have an existing data structure for the data I wanted to store! If you’re only interested in getting the data from a Google Sheet into Atlas, skip this section. Jump ahead to “Writing an Atlas Function to insert data into the collection” below. If you're interested in this whole process, keep reading.

I had an empty collection I had set up in Atlas to store my Google Analytics metadata. But I needed to establish some kind of baseline to import my information into. I didn't want a new document for every URL every week. I wanted to look up a document that already existed and append the weekly data to it.

That meant I had to figure out what my data model should be. I started writing about what I chose and how, but it got quite long, so I’ll post that in [Part 2](https://dacharycarey.com/2023/11/08/hackathon-part-2/).

Once I decided what my data model should be, I needed to get the data into Atlas and make it match my data model. I decided to save a copy of the most recent Google Sheet as a CSV, and use the [mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/) tool to load it into Atlas. This wouldn’t work the same way my Google Sheets to HTTPS Endpoint to Atlas Function pipeline would work. I did this as a one-off import to set things up.

Once I got the data into my collection, I ran some aggregation pipelines to get my data into the structure I wanted. I'll go over the specific details in my data modeling breakdown. 

I used the [Atlas Aggregation UI](https://www.mongodb.com/docs/atlas/atlas-ui/agg-pipeline/) and the [MongoDB Compass GUI](https://www.mongodb.com/products/tools/compass) to set up each aggregation stage. These tools made it easy to verify that I got the documents and data structure I expected for each stage. They provide a sample of up to 10 documents for each aggregation stage in your pipeline. You can check your work and play with different queries and stages to get the desired output.

As I was going through this exercise, I noticed some documents with URLs that we did not want in the collection. For example, I wanted to ignore URLs with a query parameter, or URLs for pages I didn't want to track, such as API reference pages for specific methods. So I wanted to bulk delete documents whose URLs matched those patterns. 

When I tried to figure out how to bulk delete in Atlas, I discovered Atlas doesn't have a bulk delete option at the moment. I had the [MongoDB Shell](https://www.mongodb.com/docs/mongodb-shell/) installed, so I decided to use that to do my bulk deletes. I leaned heavily on the GUI tools to test my queries to make sure I was only getting the documents I wanted to delete. When I had the right query results in the GUI tool, I used that query in the MongoDB Shell to perform the bulk delete.

I did this a few times to get rid of URLs that I didn't want to track. That trimmed my list of documents by about ~70 entries. I've discovered as I've done more weekly data imports, that number varies depending on the week. I tend to discard anywhere from ~70 to ~100 URLs per week that we don't want to track.

Now I had my basic data structure set up in the collection! My documents looked something like this:

![Screenshot of a transformed document containing Google Analytics data for a documentation page](/images/sdk-analytics-atlas-document.png)

The data from the spreadsheet is in the `weekly_data` array, with a new object for each week.

## Writing an Atlas Function to insert data into the collection

Now that I know what data structure I have, I can decide how to insert my incoming data into the Atlas collection. So it's time to work on an [Atlas Function](https://www.mongodb.com/docs/atlas/app-services/functions/)!

I've actually written a fair number of these to do various things at work. This is the first part of this process I’m already familiar with and could approach with confidence. So I opened the placeholder Function I created when I set up the HTTPS Endpoint, and got to work!

Atlas Functions have a [context](https://www.mongodb.com/docs/atlas/app-services/functions/context/) that gives you easy access to various services, components, and values you might need. For my needs, there were two important components:

- [services](https://www.mongodb.com/docs/atlas/app-services/functions/context/#std-label-context-services): Easily access a service you've configured. In this case, I can use `context.services.get` to access the collection where I store my data.
- [A built-in data-source client](https://www.mongodb.com/docs/atlas/app-services/functions/mongodb/): Functions come with a built-in client that makes it easy to read, write, and aggregate data. In this case, I can use `collection.updateOne` to update relevant documents in the collection.

So, first up is getting the collection I want to work with. I want to set up a query to retrieve documents with a URL matching the URL that is coming in from my Google Sheets import. I can do this in two lines:

```js
// Querying a mongodb service:
const sdkDocsCollection = context.services.get("mongodb-atlas").db("DeviceSDK").collection("SDKDocs")
const mongoDBQuery = { "url": formData["url"] };
```

I want some way of comparing the data over time. I'd like to compare week over week, but I'd also like to compare year-over-year. We have seasonal cycles where we get more and fewer page views. I don’t want to worry about declining metrics when it’s actually within the norm for seasonal variance. I need to be able to compare the same thing year over year.

The team generates the report every Monday. Because the date on the report will change year over year, I don’t want to work with the date directly. So I decided to convert my date to a week number and year. Fortunately, Stack Overflow had some good options for calculating the date, so I didn't have to write it myself:

```js
// The form data comes in as a string, so I need to make it a Date object
const dateAsDateTime = new Date(formData["date"]);

// Someone on Stack Overflow had helpfully provided this function years ago, which is just fine for my needs
function getWeek(date) {
    if (!(date instanceof Date)) date = new Date();

    // ISO week date weeks start on Monday, so correct the day number
    var nDay = (date.getDay() + 6) % 7;

    // ISO 8601 states that week 1 is the week with the first Thursday of that year
    // Set the target date to the Thursday in the target week
    date.setDate(date.getDate() - nDay + 3);

    // Store the millisecond value of the target date
    var n1stThursday = date.valueOf();

    // Set the target to the first Thursday of the year
    // First, set the target to January 1st
    date.setMonth(0, 1);

    // Not a Thursday? Correct the date to the next Thursday
    if (date.getDay() !== 4) {
    date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
    }

    // The week number is the number of weeks between the first Thursday of the year
    // and the Thursday in the target week (604800000 = 7 * 24 * 3600 * 1000)
    return 1 + Math.ceil((n1stThursday - date) / 604800000);
}

// Get the week number from the date
const weekNumber = getWeek(dateAsDateTime);
```

Now I've got the data I want to insert, but I noticed the form data comes in as strings. I want to cast the fields to the appropriate types before I insert them into my collection. So I'll create an object that has the data I want to insert as the appropriate types:

```js
const dataOfAppropriateTypes = {
    "bounce_rate": parseFloat(formData["bounce_rate"]),
    "pages_per_session": parseFloat(formData["pages_per_session"]),
    "users": parseInt(formData["users"]),
    "avg_session_duration": parseInt(formData["avg_session_duration"]),
    "unique_pageviews": parseInt(formData["unique_pageviews"]),
    "sessions": parseInt(formData["sessions"]),
    "session_duration": parseInt(formData["session_duration"])
    "year": dateAsDateTime.getFullYear(),
    "week_number": weekNumber
}
```

Now I need to figure out how to apply the update to the matching document I retrieve from my Atlas collection. I spent some time with the Atlas Function [Query MongoDB Atlas/Write](https://www.mongodb.com/docs/atlas/app-services/functions/mongodb/write/#array-update-operators) documentation. There are some array update operators I can use. Because I want to store my weekly data as objects in an array on the document matching a URL, I decided to go with the `$push` operator. This lets me push an element into an array:

```js
const update = {
    "$push": {
        "weekly_data": dataOfAppropriateTypes
    }
}
```

I'll do this as an `updateOne`, but I need to decide if I want it to be an upsert or not. For the moment I've gone with no:

```js
const options = { "upsert": false };
```

I did talk about it with the spousey, though, who pointed out I'm not currently guarding against inserting the same data twice. I *think* an `"upsert": true` will take care of that, but I want to do some testing to make sure.

Alright! Now I've got everything I need to actually perform the update. So now I can do the `updateOne` operation using the handy built-in client:

```js
sdkDocsCollection.updateOne(mongoDBQuery, update, options)
    .then(result => {
        const { matchedCount, modifiedCount } = result;
        if(matchedCount && modifiedCount) {
            console.log(`Successfully updated the item.`)
        }
    })
    .catch(err => console.error(`Failed to update the item: ${err}`))
```

To see the entire Function, check out [the GitHub Gist](https://gist.github.com/dacharyc/cf96479f81d312f6dd2796eb67cd6729).

## Run the Export

Now that I've got all the pieces put together, I can run the export! Back to my Google Sheets code. I did read in another article that you had to accept various permissions to run the Google Apps Script. I didn't want to force my colleagues to accept these permissions in a shared Google Sheets document. I created my exporter in a private test document. This *does* require me to copy and paste the content from the shared Google Sheet my private sheet. In the future I may look into how I can eliminate this step. It takes ~10 seconds, so I'm not too worried about it at the moment.

After accepting the permissions, I reload the sheet and now I see the new menu item, exactly as promised. Yay!

![Screenshot of the Google Sheets menu showing the new "MongoDB Sheets Integration" menu item](/images/run-google-sheets-export.png)

I decide to delete all the rows except the first one so I'm only trying to run this script to export data for one document. I want to make sure everything works properly.

I run the script and... hmm. I don't see the expected data in the matching document. Let me go check [the App Services logs](https://www.mongodb.com/docs/atlas/app-services/activity/view-logs/).

Oops. There's an error.

At this point, I fiddle with various things for a while to troubleshoot the error. It's related to authenticating the call to the HTTPS Endpoint. I tried twiddling a few different knobs until I found a combination of things that worked. I got a successful call to the HTTPS Endpoint! My Function correctly inserted my data as a new row to the `weekly_data` array. Everything basically worked exactly as I'd written!

So now I copy a few rows of data for a week into my test spreadsheet. Does it makes the correct updates to multiple documents? I check the documents. It works!

*Now* I try copying all of the data from the weekly spreadsheet to my test spreadsheet, and run it again. Fingers crossed...

...and it works! Yay! Now I can easily get data out of my weekly Google Sheets abomination and into Atlas.

I ran the imports for 3 months worth of weekly data just to get a baseline of data into my Atlas collection. Now it is time to start building Charts!

In the next installment, [Part 2 in my Hackathon series](https://dacharycarey.com/2023/11/08/hackathon-part-2/), I'm going to dig into the data structure. If you want to skip that part and go directly to where I start building charts, look for [Part 3](https://dacharycarey.com/2023/11/15/hackathon-part-3/) in my Hackathon series.
