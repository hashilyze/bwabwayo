import ClientChat from './ClientChat';

export default function ChatPage({ params }: { params: { productId: string; sellerId: string } }) {
  return <ClientChat productId={params.productId} sellerId={params.sellerId} />;
}