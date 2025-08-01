export default function ChatInput(){
    return(
        <div className="p-4 flex flex-wrap gap-4 p-4 items-center border-t-1 border-[#eee]">
            <div className="">+<img src="" alt="" /></div>
            <form className="flex-1 bg-[#F9F9F9] rounded-full">
                <input 
                    type="text"
                    placeholder="메세지를 입력하세요."
                    className="py-4 px-6 w-full text-sm"
                />
            </form>
        </div>
    )
}