// app/chat/[productId]/[sellerId]/page.tsx

import ClientChat from './ClientChat'

type Props = {
  params: {
    productId: string,
    sellerId: string
  }
}

export default function ChatPage({ params }: Props) {
  return <ClientChat productId={params.productId} sellerId={params.sellerId} />
}
