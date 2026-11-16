type EmailDeliveryResult = {
  data: { id: string } | null
  error: { message?: string } | null
}

type TransactionalEmailSender<Email> = {
  emails: {
    send: (email: Email) => Promise<EmailDeliveryResult>
  }
}

export async function sendTransactionalEmail<Email>(
  sender: TransactionalEmailSender<Email>,
  email: Email
): Promise<{ id: string }> {
  const { data, error } = await sender.emails.send(email)

  if (error) {
    throw new Error(error.message || 'Email delivery failed')
  }

  if (!data) {
    throw new Error('Email delivery returned no message ID')
  }

  return data
}

export async function sendBestEffortEmail<Email>(
  sender: TransactionalEmailSender<Email>,
  email: Email,
  onError: (error: Error) => void
): Promise<boolean> {
  try {
    await sendTransactionalEmail(sender, email)
    return true
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Email delivery failed'))
    return false
  }
}
