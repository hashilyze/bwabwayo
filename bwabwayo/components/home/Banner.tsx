'use client';

import styles from './Banner.module.css';

export default function Banner() {
  const bannerImages = [
    '/image/adv-bar.png',
    '/image/adv-bar.png',
    '/image/adv-bar.png',
    '/image/adv-bar.png',
    '/image/adv-bar.png'
  ];

  const duplicatedImages = [...bannerImages, ...bannerImages, ...bannerImages];

  return (
    <div className={styles.infiniteLoop}>
      <div className={styles.infiniteLoop__slider}>
        {duplicatedImages.map((image, index) => (
          <div key={`banner-${index}`} className={styles.bannerItem}>
            <img 
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}${image}`}
              alt="배너 이미지"
              className={styles.bannerItem__image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}