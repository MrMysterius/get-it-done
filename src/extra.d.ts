declare namespace Responses {
  interface Database<ResponseDataType> {
    isSuccessful: boolean;
    data: ResponseDataType;
  }
}
