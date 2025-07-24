import ProductCard from "@/components/product/productCard";

async function getSellingProducts() {
  // 실제로는 fetch 사용, 지금은 임의 데이터 반환
  // const res = await fetch("https://www.test.com", { cache: "no-store" });
  // const data = await res.json();

  const data = [
    {
      id: 1,
      title: "상품1",
      thumbnail:"https://picsum.photos/200/300?random=1",
      price:30000,
      wish_count:5,
      view_count:23,
      is_like:true,
      status:true
    },
    {
      id: 2,
      title: "상품2",
      thumbnail:"https://picsum.photos/200/300?random=2",
      price:30000,
      wish_count:5,
      view_count:23,
      is_like:false,
      status:false
    },
  ];

  return data;
}

export default async function Home() {
  const sellingProducts = await getSellingProducts();

  return (
    <div>
      <div>
        <h1 className="text-2xl">판매상품</h1>
        <ul className="grid grid-cols-5 gap-6">
          {sellingProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}