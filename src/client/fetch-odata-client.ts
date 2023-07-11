import {
  HttpResponseModel,
  ODataClient,
  ODataResponse,
} from "@odata2ts/odata-client-api";

const DEFAULT_CONFIG: RequestInit = {
  credentials: "include",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
};

export class FetchODataClient implements ODataClient<RequestInit> {
  private fetchRequestConfig;
  private beforeRequestHandlers: ((
    url: string,
    requestConfig: RequestInit
  ) => Promise<void>)[] = [];
  private afterResponseHandlers: ((response: Response) => Promise<void>)[] = [];

  constructor(fetchRequestConfig?: RequestInit) {
    this.fetchRequestConfig = {
      ...DEFAULT_CONFIG,
      ...fetchRequestConfig,
      headers: { ...DEFAULT_CONFIG.headers, ...fetchRequestConfig?.headers },
    };
  }

  public addBeforeRequestHandler(
    handler: (url: string, requestConfig: RequestInit) => Promise<void>,
    contextObject?: any
  ): void {
    if (contextObject) {
      handler = handler.bind(contextObject);
    }
    this.beforeRequestHandlers.push(handler);
  }

  public addAfterResponseHandler(
    handler: (response: Response) => Promise<void>
  ): void {
    this.afterResponseHandlers.push(handler);
  }

  private async mapResponse<ResponseModel>(
    fetchResponse: Promise<Response>
  ): ODataResponse<ResponseModel> {
    const response: Response = await fetchResponse;
    if (!response.ok) {
      throw new Error(
        `${response.status} ${response.statusText}\n\n${await response.text()}`
      );
    }
    await Promise.all(
      this.afterResponseHandlers.map((handler) => handler(response.clone()))
    );

    const headers: { [index: string]: string } = {};
    response.headers.forEach(
      (value: string, key: string) => (headers[key.toLowerCase()] = value)
    );

    if (headers["content-length"] == "0") {
      const mappedResponse: HttpResponseModel<ResponseModel> = {
        data: null as ResponseModel,
        headers: headers,
        status: response.status,
        statusText: response.statusText,
      };
      return mappedResponse;
    } else {
      const data: any = await response.json();
      const mappedResponse: HttpResponseModel<ResponseModel> = {
        data: data,
        headers: headers,
        status: response.status,
        statusText: response.statusText,
      };
      return mappedResponse;
    }
  }

  public async fetch(
    url: string,
    requestConfig?: RequestInit
  ): Promise<Response> {
    const config = {
      ...this.fetchRequestConfig,
      ...requestConfig,
      headers: {
        ...this.fetchRequestConfig.headers,
        ...requestConfig?.headers,
      },
    };
    await Promise.all(
      this.beforeRequestHandlers.map((handler) => handler(url, config))
    );
    return fetch(url, config);
  }

  public async post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestInit
  ): ODataResponse<ResponseModel> {
    const config = {
      ...this.fetchRequestConfig,
      ...requestConfig,
      method: "POST",
      headers: {
        ...this.fetchRequestConfig.headers,
        ...requestConfig?.headers,
      },
      body: JSON.stringify(data),
    };
    await Promise.all(
      this.beforeRequestHandlers.map((handler) => handler(url, config))
    );
    return this.mapResponse(fetch(url, config));
  }

  public async get<ResponseModel>(
    url: string,
    requestConfig?: RequestInit
  ): ODataResponse<ResponseModel> {
    const config = {
      ...this.fetchRequestConfig,
      ...requestConfig,
      headers: {
        ...this.fetchRequestConfig.headers,
        ...requestConfig?.headers,
      },
      method: "GET",
    };
    await Promise.all(
      this.beforeRequestHandlers.map((handler) => handler(url, config))
    );
    return this.mapResponse(fetch(url, config));
  }

  public async put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestInit
  ): ODataResponse<ResponseModel> {
    const config = {
      ...this.fetchRequestConfig,
      ...requestConfig,
      headers: {
        ...this.fetchRequestConfig.headers,
        ...requestConfig?.headers,
      },
      method: "PUT",
      body: JSON.stringify(data),
    };
    await Promise.all(
      this.beforeRequestHandlers.map((handler) => handler(url, config))
    );
    return this.mapResponse(fetch(url, config));
  }

  public async patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestInit
  ): ODataResponse<ResponseModel> {
    const config = {
      ...this.fetchRequestConfig,
      ...requestConfig,
      headers: {
        ...this.fetchRequestConfig.headers,
        ...requestConfig?.headers,
      },
      method: "PATCH",
      body: JSON.stringify(data),
    };
    await Promise.all(
      this.beforeRequestHandlers.map((handler) => handler(url, config))
    );
    return this.mapResponse(fetch(url, config));
  }

  public async merge?<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestInit
  ): ODataResponse<ResponseModel> {
    return this.patch(url, data, requestConfig);
  }

  public async delete(
    url: string,
    requestConfig?: RequestInit
  ): ODataResponse<void> {
    const config = {
      ...this.fetchRequestConfig,
      ...requestConfig,
      headers: {
        ...this.fetchRequestConfig.headers,
        ...requestConfig?.headers,
      },
      method: "DELETE",
    };
    await Promise.all(
      this.beforeRequestHandlers.map((handler) => handler(url, config))
    );
    return this.mapResponse(fetch(url, config));
  }
}
