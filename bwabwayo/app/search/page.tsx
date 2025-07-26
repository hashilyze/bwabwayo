import Category from "@/components/Category"

export default function SearchPage({
    searchParams,
}: {
    searchParams: { title?: string }
}) {
  return(
    <div>
      <div>{searchParams.title}</div>
    </div>
  )
}