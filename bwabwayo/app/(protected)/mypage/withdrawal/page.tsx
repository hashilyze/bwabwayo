export function withdrawalPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">회원 탈퇴</h1>
      <p className="mb-6">정말로 회원 탈퇴를 원하십니까?</p>
      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        회원 탈퇴
      </button>
    </div>
  );
}