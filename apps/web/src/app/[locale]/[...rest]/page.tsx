import NotFound from '../not-found'

type PageProps = {
  params: Promise<{
    locale: string
  }>
}

const CatchAllPage = (props: PageProps) => <NotFound params={props.params} />

export default CatchAllPage
