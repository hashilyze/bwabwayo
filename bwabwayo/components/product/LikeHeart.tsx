'use client';

export default function LikeHeart({ isLiked }: { isLiked: boolean }) {
    const handleHeartClick = (event: React.MouseEvent) => {
        // 부모 요소로의 이벤트 전파를 막음
        event.stopPropagation();
        
        // 여기에 나중에 좋아요 기능 로직을 추가하면 됩니다
        console.log('하트 클릭됨');
    };

    return (
        <div onClick={handleHeartClick} style={{ cursor: 'pointer' }}>
            <img
                src={isLiked ? "/icon/heart-on.svg" : "/icon/heart-off.svg"} 
                alt="찜하기" 
            />
        </div>
    );
}