// types/daum.d.ts
export interface DaumPostcodeData {
  address: string;
  addressType: 'R' | 'J';
  bname?: string;
  buildingName?: string;
  zonecode: string;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };
    };
  }
}
