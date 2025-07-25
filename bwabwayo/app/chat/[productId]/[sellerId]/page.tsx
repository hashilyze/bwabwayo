// app/chat/[productId]/[sellerId]/page.tsx

import ClientChat from './ClientChat'

export default function ChatPage({
  params,
}: {
  params: { productId: string; sellerId: string }
}) {
  const { productId, sellerId } = params

  return <ClientChat productId={productId} sellerId={sellerId} />
}
