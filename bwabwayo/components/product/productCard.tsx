import Link from 'next/link';

type Product = {
    id: number;
    title: string;
    thumbnail: string;
    price: number;
    wish_count: number;
    view_count: number;
    is_like: boolean;
    status: boolean;
};

type Props = {
  product: Product;
};

export default function productCard({product}: Props) {
  return (
    <div>
        <div>
            <div><img src={product.thumbnail} alt="" /></div>
            <div className="heartIcon"><img src="" alt="" /></div>
        </div>
        <div>
            <p>{product.title}</p>
            <p>{product.price}</p>
            <div>
                <p>찜 {product.view_count} · 조회 {product.wish_count}</p>
                <Link href="">화상거래예약</Link>
            </div>
        </div>
    </div>
  );
}