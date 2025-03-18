type AdminPageHeaderProps = {
  title: string
  description: string
}

const AdminPageHeader = (props: AdminPageHeaderProps) => {
  const { title, description } = props

  return (
    <div className='flex items-center justify-between space-y-2'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

export default AdminPageHeader
