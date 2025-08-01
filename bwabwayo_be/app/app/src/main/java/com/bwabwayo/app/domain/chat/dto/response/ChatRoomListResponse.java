package com.bwabwayo.app.domain.chat.dto.response;

import com.bwabwayo.app.domain.chat.domain.ChatRoom;
import com.bwabwayo.app.domain.chat.dto.MessageDTO;
import com.bwabwayo.app.domain.product.domain.Product;
import com.bwabwayo.app.domain.product.enums.SaleStatus;
import com.bwabwayo.app.domain.user.domain.User;
import lombok.*;

import java.io.Serializable;

@Getter @Setter
@Builder
@AllArgsConstructor
@ToString
@NoArgsConstructor
public class ChatRoomListResponse implements Serializable {

    private Long roomId;

    private String buyerId;

    private String sellerId;

    private Long productId;

    private String productName;

    private Integer productPrice;

    private String userId;

    private String sellerProfileImageUrl;

    private String buyerProfileImageUrl;

    private String productImageUrl;

    private String myNickName;

    private String partnerNickName;

    private SaleStatus saleStatus;

    private MessageDTO lastChatmessageDto;

    public static ChatRoomListResponse fromInitial(ChatRoom room, String userId, User seller, User buyer, Product product) {
        boolean isBuyer = room.getBuyerId().equals(userId);
        String userNickname = isBuyer ? buyer.getNickname() : seller.getNickname();
        String partnerNickname = isBuyer ? seller.getNickname() : buyer.getNickname();


        return ChatRoomListResponse.builder()
                .roomId(room.getRoomId())
                .buyerId(room.getBuyerId())
                .sellerId(room.getSellerId())
                .productId(room.getProductId())
                .productName(product.getTitle()) // 이후 상품 정보 조회해서 세팅
                .productPrice(product.getPrice()) // 이후 세팅
                .userId(userId)
                .sellerProfileImageUrl(seller.getProfileImage()) // 이후 유저 프로필 조회
                .buyerProfileImageUrl(buyer.getProfileImage())
                .productImageUrl(product.getThumbnail()) // 이후 상품 이미지 조회
                .myNickName(userNickname) // 이후 유저 닉네임 조회
                .partnerNickName(partnerNickname)
                .saleStatus(product.getSaleStatus()) // 기본값이 거래중이라고 가정
                .lastChatmessageDto(null) // 아직 메시지 없음
                .build();
    }

    public static ChatRoomListResponse fromInitial(ChatRoom room, String userId,
                                                   String productName, Integer productPrice,
                                                   String sellerProfileImageUrl, String buyerProfileImageUrl,
                                                   String productImageUrl, String myNickName,
                                                   String partnerNickName) {
        boolean isBuyer = room.getBuyerId().equals(userId);

        return ChatRoomListResponse.builder()
                .roomId(room.getRoomId())
                .buyerId(room.getBuyerId())
                .sellerId(room.getSellerId())
                .productId(room.getProductId())
                .productName(productName) // 이후 상품 정보 조회해서 세팅
                .productPrice(productPrice) // 이후 세팅
                .userId(userId)
                .sellerProfileImageUrl(sellerProfileImageUrl) // 이후 유저 프로필 조회
                .buyerProfileImageUrl(buyerProfileImageUrl)
                .productImageUrl(productImageUrl) // 이후 상품 이미지 조회
                .myNickName(myNickName) // 이후 유저 닉네임 조회
                .partnerNickName(partnerNickName)
                .saleStatus(SaleStatus.AVAILABLE) // 기본값이 거래중이라고 가정
                .lastChatmessageDto(null) // 아직 메시지 없음
                .build();
    }




/*    public static ChatRoomListResponse from(ChatRoom chatRoom, MessageDTO chatMessage) {
        Long userId = chatMessage.getSenderId();
        Long partnerId = userId.equals(chatRoom.getBuyerId()) ? chatRoom.getSellerId() : chatRoom.getBuyerId();
        return ChatRoomListResponse.builder()
                .roomId(chatRoom.getRoomId())
                .buyerId(chatRoom.getBuyerId())
                .sellerId(chatRoom.getSellerId())
                .productId(chatRoom.getProductId())
                .productName(chatRoom.)

    }*/

    public void updateChatMessageDto(MessageDTO chatMessageDto) {
        this.lastChatmessageDto = chatMessageDto;
    }

    public void changePartnerInfo() {
        String tmp = myNickName;
        this.myNickName = partnerNickName;
        this.partnerNickName = tmp;

        if (this.userId.equals(sellerId)) {
            this.userId = buyerId;
        } else if (this.userId.equals(buyerId)) {
            this.userId = sellerId;
        }
    }

}
