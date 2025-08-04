package com.bwabwayo.app.domain.address.service;

import com.bwabwayo.app.domain.address.domain.DeliveryAddress;
import com.bwabwayo.app.domain.user.domain.User;
import com.bwabwayo.app.domain.auth.dto.request.UserSignUpRequest;
import com.bwabwayo.app.domain.address.repository.DeliveryAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeliveryAddressService {
    private final DeliveryAddressRepository deliveryAddressRepository;
    public void createAddress(User user, UserSignUpRequest request){
        DeliveryAddress address = DeliveryAddress.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .recipientPhoneNumber(request.getRecipientPhoneNumber())
                .zipcode(request.getZipcode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .build();
        deliveryAddressRepository.save(address);
    }

}
