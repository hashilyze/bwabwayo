// app/chat/[productId]/[sellerId]/page.tsx

import ClientChat from './ClientChat'

type Props = {
  params: {
    id: string
    seller_id: string
  }
}

export default function ChatPage({ params }: Props) {
  return <ClientChat productId={params.id} sellerId={params.seller_id} />
}
