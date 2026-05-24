// envelopes génericos de respuesta

export type ApiEnvelope<T> = {
  message?: string;
  data: T;
};