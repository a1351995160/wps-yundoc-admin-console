export const PERMISSION_NAME_BY_CODE: Record<string, string> = {
  'app-preview:create': '创建文件预览',
  'user-files:list': '查看用户文件列表',
  'user-files:rename': '重命名用户文件',
  'user-files:download': '下载用户文件',
  'user-folders:rename': '重命名用户文件夹',
  'user-files:create': '创建用户文件',
  'user-files:save-as': '另存用户文件',
  'user-files:view': '查看用户文件',
  'user-files:delete': '删除用户文件',
  'user-files:update': '更新用户文件'
}

export const PERMISSION_DESCRIPTION_BY_CODE: Record<string, string> = {
  'app-preview:create': '允许业务系统为文件生成预览资源。',
  'user-files:list': '允许查看用户文件列表。',
  'user-files:rename': '允许重命名用户文件。',
  'user-files:download': '允许下载用户文件。',
  'user-folders:rename': '允许重命名用户文件夹。',
  'user-files:create': '允许创建用户文件。',
  'user-files:save-as': '允许将文件另存为新文件。',
  'user-files:view': '允许查看用户文件内容。',
  'user-files:delete': '允许删除用户文件。',
  'user-files:update': '允许更新用户文件内容。'
}

export function formatPermissionName(apiCode: string): string {
  return PERMISSION_NAME_BY_CODE[apiCode] ?? '未命名接口能力'
}

export function formatPermissionNames(apiPermissions?: string[]): string {
  if (!apiPermissions || apiPermissions.length === 0) {
    return '-'
  }
  return apiPermissions.map(formatPermissionName).join('\uFF0C')
}
