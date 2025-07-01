import type { ClassDetail } from "./type"

export function emitClassName(classDetail: ClassDetail): string {
  const base = emitBaseClassName(classDetail)

  if (classDetail.important === "leading") {
    return `${classDetail.prefix}!${base}`
  }
  if (classDetail.important === "trailing") {
    return `${classDetail.prefix}${base}!`
  }

  return `${classDetail.prefix}${base}`
}

export function emitBaseClassName(classDetail: ClassDetail): string {
  const negativePrefix = classDetail.isNegative ? "-" : ""
  const valuePart = classDetail.value === "" ? "" : `-${classDetail.value}`

  return `${negativePrefix}${classDetail.type}${valuePart}`
}
