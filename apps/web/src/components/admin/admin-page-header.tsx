type AdminPageHeaderProps = {
  title: string
  description: string
}

const AdminPageHeader = (props: AdminPageHeaderProps) => {
  const { title, description } = props

  return (
    <div className='mb-8 flex items-center justify-between border-b-[0.5px] border-[var(--border-faint)] pb-8'>
      <div className='space-y-2'>
        <span className='label-mono'>Admin</span>
        <h2 className='text-[clamp(28px,3vw,36px)] font-medium tracking-tighter'>{title}</h2>
        <p className='text-text-secondary max-w-2xl text-[15px] leading-relaxed'>{description}</p>
      </div>
    </div>
  )
}

export default AdminPageHeader
