
class ApiResponse {
  constructor(statusCode, messageOrData, dataOrMessage = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;

    const firstIsString = typeof messageOrData === "string";
    const secondIsString = typeof dataOrMessage === "string";

    if (firstIsString) {
      this.message = messageOrData;
      this.data = secondIsString ? null : dataOrMessage;
    } else {
      this.data = messageOrData ?? null;
      this.message = secondIsString ? dataOrMessage : "Success";
    }
  }
}

export default ApiResponse;
