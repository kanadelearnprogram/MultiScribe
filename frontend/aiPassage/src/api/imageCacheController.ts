// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** 此处后端没有提供注释 GET /imageCache/getInfo/${param0} */
export async function getInfo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getInfoParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ImageCache>(`/imageCache/getInfo/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /imageCache/list */
export async function list(options?: { [key: string]: any }) {
  return request<API.ImageCache[]>("/imageCache/list", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /imageCache/page */
export async function page(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pageParams,
  options?: { [key: string]: any }
) {
  return request<API.PageImageCache>("/imageCache/page", {
    method: "GET",
    params: {
      ...params,
      page: undefined,
      ...params["page"],
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /imageCache/remove/${param0} */
export async function remove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.removeParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<boolean>(`/imageCache/remove/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /imageCache/save */
export async function save(
  body: API.ImageCache,
  options?: { [key: string]: any }
) {
  return request<boolean>("/imageCache/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /imageCache/update */
export async function update(
  body: API.ImageCache,
  options?: { [key: string]: any }
) {
  return request<boolean>("/imageCache/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
