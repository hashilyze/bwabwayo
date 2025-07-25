export default function SearchPage({
    searchParams,
}: {
    searchParams: { query?: string }
}) {
  return(
    <div>{searchParams.query}</div>
  )
}