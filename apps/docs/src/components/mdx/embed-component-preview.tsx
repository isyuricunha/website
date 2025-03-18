type EmbedComponentPreviewProps = {
  name: string
}

const EmbedComponentPreview = (props: EmbedComponentPreviewProps) => {
  const { name } = props

  return (
    <div className='aspect-[4/2.5] w-full overflow-hidden rounded-md border'>
      <iframe
        src={`/embed?component=${name}`}
        title={`${name.split('/')[0]} demo`}
        className='size-full'
        // eslint-disable-next-line @eslint-react/dom/no-unsafe-iframe-sandbox -- safe to use
        sandbox='allow-scripts allow-same-origin'
        loading='lazy'
        referrerPolicy='no-referrer'
      />
    </div>
  )
}

export default EmbedComponentPreview
