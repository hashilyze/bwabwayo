import Link from "next/link"

export default function RecommendItems() {
    const categoryList = [
        // {
        //     id: 1,
        //     name: '아이폰',
        //     image: 'image/rec-category/iphone.png'
        // },
        {
            id: 2,
            name: '키링',
            image: 'image/rec-category/keyring.png'
        },
        {
            id: 3,
            name: '스투시',
            image: 'image/rec-category/stussy.png'
        },
        {
            id: 4,
            name: '베이프',
            image: 'image/rec-category/bape.png'
        },
        {
            id: 5,
            name: '조던',
            image: 'image/rec-category/jordan.png'
        },
        {
            id: 6,
            name: '피규어',
            image: 'image/rec-category/figure.png'
        },
        {
            id: 7,
            name: '그래픽카드',
            image: 'image/rec-category/graphic-card.png'
        },
        {
            id: 8,
            name: '티켓',
            image: 'image/rec-category/ticket.png'
        },
    ]

  return (
    <ul className="grid grid-cols-7 gap-10 py-20">
      {categoryList.map((category) => (
        <li key={category.id} className="">
            <Link href={`/search?title=${category.name}`} className="flex flex-col items-center justify-center gap-4">
                <div className="rounded-full p-8 overflow-hidden bg-[#F9F9F9] aspect-square group perspective-1000 transition-transform duration-300 ease-in-out hover:rotate-y-360 transform-style-preserve-3d">
                    <img 
                        src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/${category.image}`} 
                        alt={category.name} 
                        className="" 
                    />
                </div>
                <p className="text-xl font-bold">{category.name}</p>
            </Link>
        </li>
      ))}
    </ul>
  )
}