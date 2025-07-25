import ClientChat from './ClientChat'

interface ChatPageProps {
  params: {
    productId: string
    sellerId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { productId, sellerId } = params
  return <ClientChat productId={productId} sellerId={sellerId} />
}