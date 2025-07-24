import Link from 'next/link';
import ProductCard from "@/components/product/ProductCard";

async function getSellingProducts() {
  // 실제로는 fetch 사용, 지금은 임의 데이터 반환
  // const res = await fetch("http://43.203.212.189:8081/", { cache: "no-store" });
  // const data = await res.json();

  const data = [
    {
      id: 1,
      seller_id: 5524,
      title: "팝마트 라부부 코카콜라 시리즈 인형 키링",
      thumbnail:"https://picsum.photos/200/300?random=1",
      price:70000,
      wish_count:5,
      view_count:23,
      is_like:true,
      status:true
    },
    {
      id: 2,
      seller_id: 2,
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
        <h1 className="text-2xl font-bold mb-5">판매상품</h1>
        <ul className="grid grid-cols-4 gap-[40px]">
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