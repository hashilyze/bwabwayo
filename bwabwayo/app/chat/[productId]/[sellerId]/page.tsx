// app/chat/[productId]/[sellerId]/page.tsx
import ChatClient from './ChatClient'

export const dynamic = 'force-dynamic'

export default async function ChatPage(props: { params: { productId: string; sellerId: string } }) {
  const params = await props.params;
  const { productId, sellerId } = params;
  return <ChatClient productId={String(productId)} sellerId={String(sellerId)} />
}