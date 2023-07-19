// @generated by protoc-gen-es v1.2.1 with parameter "target=ts"
// @generated from file testing.proto (package testing, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message testing.StatusGetRequest
 */
export class StatusGetRequest extends Message<StatusGetRequest> {
  /**
   * @generated from field: testing.StatusGetRequest.Code code = 1;
   */
  code = StatusGetRequest_Code.OK;

  constructor(data?: PartialMessage<StatusGetRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.StatusGetRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "code", kind: "enum", T: proto3.getEnumType(StatusGetRequest_Code) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): StatusGetRequest {
    return new StatusGetRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): StatusGetRequest {
    return new StatusGetRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): StatusGetRequest {
    return new StatusGetRequest().fromJsonString(jsonString, options);
  }

  static equals(a: StatusGetRequest | PlainMessage<StatusGetRequest> | undefined, b: StatusGetRequest | PlainMessage<StatusGetRequest> | undefined): boolean {
    return proto3.util.equals(StatusGetRequest, a, b);
  }
}

/**
 * @generated from enum testing.StatusGetRequest.Code
 */
export enum StatusGetRequest_Code {
  /**
   * @generated from enum value: OK = 0;
   */
  OK = 0,

  /**
   * @generated from enum value: CANCELED = 1;
   */
  CANCELED = 1,

  /**
   * @generated from enum value: UNKNOWN = 2;
   */
  UNKNOWN = 2,

  /**
   * @generated from enum value: INVALIDARGUMENT = 3;
   */
  INVALIDARGUMENT = 3,

  /**
   * @generated from enum value: DEADLINE_EXCEEDED = 4;
   */
  DEADLINE_EXCEEDED = 4,

  /**
   * @generated from enum value: NOT_FOUND = 5;
   */
  NOT_FOUND = 5,

  /**
   * @generated from enum value: ALREADY_EXISTS = 6;
   */
  ALREADY_EXISTS = 6,

  /**
   * @generated from enum value: PERMISSION_DENIED = 7;
   */
  PERMISSION_DENIED = 7,

  /**
   * @generated from enum value: RESOURCE_EXHAUSTED = 8;
   */
  RESOURCE_EXHAUSTED = 8,

  /**
   * @generated from enum value: FAILED_PRECONDITION = 9;
   */
  FAILED_PRECONDITION = 9,

  /**
   * @generated from enum value: ABORTED = 10;
   */
  ABORTED = 10,

  /**
   * @generated from enum value: OUT_OF_RANGE = 11;
   */
  OUT_OF_RANGE = 11,

  /**
   * @generated from enum value: UNIMPLEMENTED = 12;
   */
  UNIMPLEMENTED = 12,

  /**
   * @generated from enum value: INTERNAL = 13;
   */
  INTERNAL = 13,

  /**
   * @generated from enum value: UNAVAILABLE = 14;
   */
  UNAVAILABLE = 14,

  /**
   * @generated from enum value: DATALOSS = 15;
   */
  DATALOSS = 15,

  /**
   * @generated from enum value: UNAUTHENTICATED = 16;
   */
  UNAUTHENTICATED = 16,
}
// Retrieve enum metadata with: proto3.getEnumType(StatusGetRequest_Code)
proto3.util.setEnumType(StatusGetRequest_Code, "testing.StatusGetRequest.Code", [
  { no: 0, name: "OK" },
  { no: 1, name: "CANCELED" },
  { no: 2, name: "UNKNOWN" },
  { no: 3, name: "INVALIDARGUMENT" },
  { no: 4, name: "DEADLINE_EXCEEDED" },
  { no: 5, name: "NOT_FOUND" },
  { no: 6, name: "ALREADY_EXISTS" },
  { no: 7, name: "PERMISSION_DENIED" },
  { no: 8, name: "RESOURCE_EXHAUSTED" },
  { no: 9, name: "FAILED_PRECONDITION" },
  { no: 10, name: "ABORTED" },
  { no: 11, name: "OUT_OF_RANGE" },
  { no: 12, name: "UNIMPLEMENTED" },
  { no: 13, name: "INTERNAL" },
  { no: 14, name: "UNAVAILABLE" },
  { no: 15, name: "DATALOSS" },
  { no: 16, name: "UNAUTHENTICATED" },
]);

/**
 * @generated from message testing.StatusGetResponse
 */
export class StatusGetResponse extends Message<StatusGetResponse> {
  /**
   * @generated from field: string msg = 1;
   */
  msg = "";

  constructor(data?: PartialMessage<StatusGetResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.StatusGetResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "msg", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): StatusGetResponse {
    return new StatusGetResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): StatusGetResponse {
    return new StatusGetResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): StatusGetResponse {
    return new StatusGetResponse().fromJsonString(jsonString, options);
  }

  static equals(a: StatusGetResponse | PlainMessage<StatusGetResponse> | undefined, b: StatusGetResponse | PlainMessage<StatusGetResponse> | undefined): boolean {
    return proto3.util.equals(StatusGetResponse, a, b);
  }
}

/**
 * @generated from message testing.DetailGetRequest
 */
export class DetailGetRequest extends Message<DetailGetRequest> {
  /**
   * @generated from field: testing.DetailGetRequest.Code code = 1;
   */
  code = DetailGetRequest_Code.OK;

  constructor(data?: PartialMessage<DetailGetRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.DetailGetRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "code", kind: "enum", T: proto3.getEnumType(DetailGetRequest_Code) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DetailGetRequest {
    return new DetailGetRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DetailGetRequest {
    return new DetailGetRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DetailGetRequest {
    return new DetailGetRequest().fromJsonString(jsonString, options);
  }

  static equals(a: DetailGetRequest | PlainMessage<DetailGetRequest> | undefined, b: DetailGetRequest | PlainMessage<DetailGetRequest> | undefined): boolean {
    return proto3.util.equals(DetailGetRequest, a, b);
  }
}

/**
 * @generated from enum testing.DetailGetRequest.Code
 */
export enum DetailGetRequest_Code {
  /**
   * @generated from enum value: OK = 0;
   */
  OK = 0,

  /**
   * @generated from enum value: RETRY_INFO = 1;
   */
  RETRY_INFO = 1,

  /**
   * @generated from enum value: DEBUG_INFO = 2;
   */
  DEBUG_INFO = 2,

  /**
   * @generated from enum value: QUOTA_FAILURE = 3;
   */
  QUOTA_FAILURE = 3,

  /**
   * @generated from enum value: ERROR_INFO = 4;
   */
  ERROR_INFO = 4,

  /**
   * @generated from enum value: PRECONDITION_FAILURE = 5;
   */
  PRECONDITION_FAILURE = 5,

  /**
   * @generated from enum value: BAD_REQUEST = 6;
   */
  BAD_REQUEST = 6,

  /**
   * @generated from enum value: REQUEST_INFO = 7;
   */
  REQUEST_INFO = 7,

  /**
   * @generated from enum value: RESOURCE_INFO = 8;
   */
  RESOURCE_INFO = 8,

  /**
   * @generated from enum value: HELP = 9;
   */
  HELP = 9,

  /**
   * @generated from enum value: LOCALIZED_MESSAGE = 10;
   */
  LOCALIZED_MESSAGE = 10,

  /**
   * @generated from enum value: COMBINED_ALL = 20;
   */
  COMBINED_ALL = 20,
}
// Retrieve enum metadata with: proto3.getEnumType(DetailGetRequest_Code)
proto3.util.setEnumType(DetailGetRequest_Code, "testing.DetailGetRequest.Code", [
  { no: 0, name: "OK" },
  { no: 1, name: "RETRY_INFO" },
  { no: 2, name: "DEBUG_INFO" },
  { no: 3, name: "QUOTA_FAILURE" },
  { no: 4, name: "ERROR_INFO" },
  { no: 5, name: "PRECONDITION_FAILURE" },
  { no: 6, name: "BAD_REQUEST" },
  { no: 7, name: "REQUEST_INFO" },
  { no: 8, name: "RESOURCE_INFO" },
  { no: 9, name: "HELP" },
  { no: 10, name: "LOCALIZED_MESSAGE" },
  { no: 20, name: "COMBINED_ALL" },
]);

/**
 * @generated from message testing.DetailGetResponse
 */
export class DetailGetResponse extends Message<DetailGetResponse> {
  /**
   * @generated from field: string msg = 1;
   */
  msg = "";

  constructor(data?: PartialMessage<DetailGetResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.DetailGetResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "msg", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DetailGetResponse {
    return new DetailGetResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DetailGetResponse {
    return new DetailGetResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DetailGetResponse {
    return new DetailGetResponse().fromJsonString(jsonString, options);
  }

  static equals(a: DetailGetResponse | PlainMessage<DetailGetResponse> | undefined, b: DetailGetResponse | PlainMessage<DetailGetResponse> | undefined): boolean {
    return proto3.util.equals(DetailGetResponse, a, b);
  }
}

/**
 * @generated from message testing.MetadataGetResponse
 */
export class MetadataGetResponse extends Message<MetadataGetResponse> {
  /**
   * @generated from field: repeated testing.MetadataGetResponse.Entry metadata = 1;
   */
  metadata: MetadataGetResponse_Entry[] = [];

  constructor(data?: PartialMessage<MetadataGetResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.MetadataGetResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "metadata", kind: "message", T: MetadataGetResponse_Entry, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MetadataGetResponse {
    return new MetadataGetResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MetadataGetResponse {
    return new MetadataGetResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MetadataGetResponse {
    return new MetadataGetResponse().fromJsonString(jsonString, options);
  }

  static equals(a: MetadataGetResponse | PlainMessage<MetadataGetResponse> | undefined, b: MetadataGetResponse | PlainMessage<MetadataGetResponse> | undefined): boolean {
    return proto3.util.equals(MetadataGetResponse, a, b);
  }
}

/**
 * @generated from message testing.MetadataGetResponse.Entry
 */
export class MetadataGetResponse_Entry extends Message<MetadataGetResponse_Entry> {
  /**
   * @generated from field: string key = 1;
   */
  key = "";

  /**
   * @generated from field: repeated string value = 2;
   */
  value: string[] = [];

  constructor(data?: PartialMessage<MetadataGetResponse_Entry>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.MetadataGetResponse.Entry";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "key", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "value", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MetadataGetResponse_Entry {
    return new MetadataGetResponse_Entry().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MetadataGetResponse_Entry {
    return new MetadataGetResponse_Entry().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MetadataGetResponse_Entry {
    return new MetadataGetResponse_Entry().fromJsonString(jsonString, options);
  }

  static equals(a: MetadataGetResponse_Entry | PlainMessage<MetadataGetResponse_Entry> | undefined, b: MetadataGetResponse_Entry | PlainMessage<MetadataGetResponse_Entry> | undefined): boolean {
    return proto3.util.equals(MetadataGetResponse_Entry, a, b);
  }
}

/**
 * @generated from message testing.SetRequest
 */
export class SetRequest extends Message<SetRequest> {
  /**
   * @generated from field: testing.SetRequest.HealthCheckStatus status = 1;
   */
  status = SetRequest_HealthCheckStatus.UNKNOWN;

  constructor(data?: PartialMessage<SetRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.SetRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "status", kind: "enum", T: proto3.getEnumType(SetRequest_HealthCheckStatus) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SetRequest {
    return new SetRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SetRequest {
    return new SetRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SetRequest {
    return new SetRequest().fromJsonString(jsonString, options);
  }

  static equals(a: SetRequest | PlainMessage<SetRequest> | undefined, b: SetRequest | PlainMessage<SetRequest> | undefined): boolean {
    return proto3.util.equals(SetRequest, a, b);
  }
}

/**
 * @generated from enum testing.SetRequest.HealthCheckStatus
 */
export enum SetRequest_HealthCheckStatus {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: SERVING = 1;
   */
  SERVING = 1,

  /**
   * @generated from enum value: NOT_SERVING = 2;
   */
  NOT_SERVING = 2,

  /**
   * @generated from enum value: SERVICE_UNKNOWN = 3;
   */
  SERVICE_UNKNOWN = 3,
}
// Retrieve enum metadata with: proto3.getEnumType(SetRequest_HealthCheckStatus)
proto3.util.setEnumType(SetRequest_HealthCheckStatus, "testing.SetRequest.HealthCheckStatus", [
  { no: 0, name: "UNKNOWN" },
  { no: 1, name: "SERVING" },
  { no: 2, name: "NOT_SERVING" },
  { no: 3, name: "SERVICE_UNKNOWN" },
]);

/**
 * @generated from message testing.EchoRequest
 */
export class EchoRequest extends Message<EchoRequest> {
  /**
   * @generated from field: string msg = 1;
   */
  msg = "";

  constructor(data?: PartialMessage<EchoRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.EchoRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "msg", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): EchoRequest {
    return new EchoRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): EchoRequest {
    return new EchoRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): EchoRequest {
    return new EchoRequest().fromJsonString(jsonString, options);
  }

  static equals(a: EchoRequest | PlainMessage<EchoRequest> | undefined, b: EchoRequest | PlainMessage<EchoRequest> | undefined): boolean {
    return proto3.util.equals(EchoRequest, a, b);
  }
}

/**
 * @generated from message testing.EchoResponse
 */
export class EchoResponse extends Message<EchoResponse> {
  /**
   * @generated from field: string msg = 1;
   */
  msg = "";

  constructor(data?: PartialMessage<EchoResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testing.EchoResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "msg", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): EchoResponse {
    return new EchoResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): EchoResponse {
    return new EchoResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): EchoResponse {
    return new EchoResponse().fromJsonString(jsonString, options);
  }

  static equals(a: EchoResponse | PlainMessage<EchoResponse> | undefined, b: EchoResponse | PlainMessage<EchoResponse> | undefined): boolean {
    return proto3.util.equals(EchoResponse, a, b);
  }
}

