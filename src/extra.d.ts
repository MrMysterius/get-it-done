declare namespace GIDData {
  interface gid_info {
    key: string;
    value: any;
  }
}

declare namespace Responses {
  interface Database<ResponseDataType> {
    isSuccessful: boolean;
    data: ResponseDataType;
  }
}

declare interface Error {
  status?: number;
}
