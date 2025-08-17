import { ProductWithSeller } from '@/stores/product/productStore';
import { ProductCardUIData } from '@/stores/product/productStore';
import {ActivityProduct} from '@/stores/mypage/myActivityStore'

export const transformToProductCardData = (item: ProductWithSeller): ProductCardUIData => {
  // 핵심 데이터는 item.product 안에 있습니다.
  const { product } = item;

  return {
    // id가 없는 경우를 대비해 기본값 0을 설정합니다. (React key 오류 방지)
    id: product.id || 0,
    
    // 썸네일이 없을 경우 표시할 기본 이미지 경로를 설정합니다.
    thumbnail: product.thumbnail || '/image/no-image.jpg',
    
    title: product.title,
    price: product.price,

    // viewCount와 wishCount는 string? 타입이므로, 숫자로 변환하고 기본값을 0으로 설정합니다.
    // parseInt의 두 번째 인자 10은 10진수로 변환함을 의미합니다.
    viewCount: parseInt(product.viewCount || '0', 10),
    wishCount: parseInt(product.wishCount || '0', 10),

    // isLike가 undefined일 경우를 대비해 false를 기본값으로 설정합니다.
    isLike: product.isLike || false,
    
    // 옵셔널(?) 필드는 그대로 전달합니다. 값이 없으면 undefined가 됩니다.
    canVideoCall: product.canVideoCall,
    createdAt: product.createdAt,
    saleStatusCode: product.saleStatusCode,
    isMine: product.isMine || false,
  };
};