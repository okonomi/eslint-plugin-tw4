import type { ClassDetail } from "./type"

export function emitClassName(
  classDetail: ClassDetail,
  config?: { prefix?: string; separator?: string },
): string {
  const base = emitBaseClassName(classDetail, config)

  if (classDetail.important === "leading") {
    return `${classDetail.prefix}!${base}`
  }
  if (classDetail.important === "trailing") {
    return `${classDetail.prefix}${base}!`
  }

  return `${classDetail.prefix}${base}`
}

export function emitBaseClassName(
  classDetail: ClassDetail,
  _config?: { prefix?: string; separator?: string },
): string {
  const negativePrefix = classDetail.isNegative ? "-" : ""
  const valuePart = classDetail.value === "" ? "" : `-${classDetail.value}`

  return `${negativePrefix}${classDetail.type}${valuePart}`
}
