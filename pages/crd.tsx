import { useEffect } from 'react';

const CardPage = () => {
  useEffect(() => {
    // Init tooltips
    tippy('.link',{
      placement: 'bottom'
    });

    // Toggle mode
    const toggle = document.querySelector('.js-change-theme');
    const body = document.querySelector('body');
    const profile = document.getElementById('profile');
    
    toggle.addEventListener('click', () => {
      if (body.classList.contains('text-gray-900')) {
        toggle.innerHTML = "☀️";
        body.classList.remove('text-gray-900');
        body.classList.add('text-gray-100');
        profile.classList.remove('bg-white');
        profile.classList.add('bg-gray-900');
      } else {
        toggle.innerHTML = "🌙";
        body.classList.remove('text-gray-100');
        body.classList.add('text-gray-900');
        profile.classList.remove('bg-gray-900');			
        profile.classList.add('bg-white');
      }
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Tailwind Profile Card Template : Tailwind Toolbox</title>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <meta name="author" content="" />
        <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css"/>
      </head>
      <body className="font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover" style={{backgroundImage: "url('https://source.unsplash.com/1L71sPT5XKc')"}}>
        <div className="max-w-4xl flex items-center h-auto lg:h-screen flex-wrap mx-auto my-32 lg:my-0">
          <div id="profile" className="w-full lg:w-3/5 rounded-lg lg:rounded-l-lg lg:rounded-r-none shadow-2xl bg-white opacity-75 mx-6 lg:mx-0">
            <div className="p-4 md:p-12 text-center lg:text-left">
              <div className="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-48 w-48 bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/MP0IUfwrn0A')"}}></div>
              <h1 className="text-3xl font-bold pt-8 lg:pt-0">Your Name</h1>
              <div className="mx-auto lg:mx-0 w-4/5 pt-3 border-b-2 border-green-500 opacity-25"></div>
              <p className="pt-4 text-base font-bold flex items-center justify-center lg:justify-start">
                <svg className="h-4 fill-current text-green-700 pr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9 12H1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-8v2H9v-2zm0-1H0V5c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v6h-9V9H9v2zm3-8V2H8v1h4z"/>
                </svg>
                What you do
              </p>
              <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
                <svg className="h-4 fill-current text-green-700 pr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-1a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 9h2v2H3V9zm0-4h2v2H3V5zm0-4h2v2H3V1zm4 8h10v10H7V9zm10-4h2v2h-2V5zm0-4h2v2h-2V1zm-4 12h2v2h-2v-2z"/>
                </svg>
                Where you work
              </p>
              <p className="pt-8 text-sm">Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.</p>
              <div className="pt-12 pb-8">
                <button className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-full">
                  Contact Me
                </button>
              </div>
              <div className="mt-6 pb-16 lg:pb-0 w-4/5 lg:w-full mx-auto flex flex-wrap items-center justify-between">
                <a href="#pablo" className="link">
                  <svg className="fill-current text-gray-700 opacity-75 h-8 pr-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21.404 12.75c0 6.913-5.562 12.525-12.465 12.525-2.4 0-4.62-.687-6.503-1.866.318-.075.606-.108.824-.108 1.563 0 2.855 1.018 3.317 2.402a5.014 5.014 0 0 0 3.33-1.268 2.5 2.5 0 0 1-2.341-1.732c.38.075.782.075 1.17.075.557 0 1.102-.075 1.595-.258-2.684-.538-4.716-2.792-4.716-5.43V6.184c.322.183.693.308 1.102.308.47 0 .884-.16 1.268-.402a4.874 4.874 0 0 1-1.304-.358c-.002 1.68-1.287 3.056-2.924 3.38a2.468 2.468 0 0 0-.63.2c-.328-.337-.642-.723-.914-1.164-.37-.61-.692-1.297-.95-2.05-.273-.802-.49-1.662-.65-2.56-.158-.913-.25-1.875-.25-2.876 0-.315-.005-.637-.014-.955-.905.8-2.007 1.397-3.217 1.716-.475.127-.994.2-1.56.2-.95 0-1.842-.193-2.673-.543a4.803 4.803 0 0 0 2.257-.64c.54-.317 1.013-.72 1.395-1.188a5.036 5.036 0 0 0-2.303.64c-.767.35-1.444.8-2.014 1.337-.56.537-1.006 1.16-1.327 1.836-.3.633-.518 1.318-.648 2.04-.137.738-.2 1.495-.2 2.29 0 .403 0 .81.05 1.22C2.767 10.33 1.367 8.71 1.367 6.59c0-.6.133-1.18.378-1.722a5.016 5.016 0 0 0 2.29 1.263c-.212-.882-.212-1.812-.033-2.767C5.268 3.54 7.314 5.1 9.8 5.48c.265-.507.59-.95.95-1.33.473-.504 1.03-.898 1.64-1.17.45-.207.937-.34 1.444-.39a5.002 5.002 0 0 1 3.78-.95c.448 0 .884.058 1.304.162.912.207 1.723.627 2.396 1.195.462-.1.938-.162 1.43-.162 1.385 0 2.66.45 3.687 1.203a4.875 4.875 0 0 1-2.347 1.28c.713.413 1.288.998 1.686 1.693a9.35 9.35 0 0 0 2.08-.945c.09-.05.2-.05.287-.05.44 0 .86.177 1.216.497a2.47 2.47 0 0 1-.727 3.42 4.975 4.975 0 0 0 1.434-.388c.493.55.743 1.287.638 2.09a5.073 5.073 0 0 1-2.605 3.944c1.036.1 2.007-.212 2.87-.802a10.27 10.27 0 0 1-2.48.303c-.585 0-1.16-.05-1.722-.148.663 2.063 2.586 3.6 4.867 3.637a10.163 10.163 0 0 1-6.152 2.047c-.39 0-.78 0-1.168-.05a14.248 14.248 0 0 0 7.553 2.146c8.65 0 13.398-7.164 13.398-13.364 0-.2 0-.402-.014-.602a9.487 9.487 0 0 0 2.325-2.422c.88-1.625 1.334-3.45 1.334-5.356 0-.354 0-.694-.027-1.04.915-.666 1.707-1.507 2.33-2.47a9.38 9.38 0 0 1-2.67.735c.948-.566 1.767-1.29 2.426-2.136-.85.504-1.79.872-2.786 1.077z"/>
                  </svg>
                </a>
                <a href="#pablo" className="link">
                  <svg className="fill-current text-gray-700 opacity-75 h-8 pr-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21 2H3a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 18H5v-6h4v6zm0-8H5V7h4v3zm10 8h-4v-6h4v6zm0-8h-4V7h4v3z"/>
                  </svg>
                </a>
                <a href="#pablo" className="link">
                  <svg className="fill-current text-gray-700 opacity-75 h-8 pr-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20.31 13.55A3 3 0 0 0 22 12a10 10 0 1 0-10 10 3 3 0 0 0 1.55-5.69 4 4 0 1 1-4.51-6.47 3 3 0 0 0-2.69-4.69 16 16 0 1 0 18.2 8.54z"/>
                  </svg>
                </a>
                <a href="#pablo" className="link">
                  <svg className="fill-current text-gray-700 opacity-75 h-8 pr-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 15h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5zm-2-3.5h-5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h5c.28 0 .5.22.5.5s-.22.5-.5.5zm2-3.5h-7c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h7c.28 0 .5.22.5.5s-.22.5-.5.5zm-7-4h4c.28 0 .5.22.5.5s-.22.5-.5.5h-4c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 right-0 p-6">
          <button className="js-change-theme bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-full">
            ☀️
          </button>
        </div>
        <script src="https://unpkg.com/tippy.js@6.3.1/dist/tippy-bundle.umd.js"></script>
      </body>
    </html>
  );
};

export default CardPage;
function tippy(arg0: string, arg1: { placement: string; }) {
    throw new Error('Function not implemented.');
}

