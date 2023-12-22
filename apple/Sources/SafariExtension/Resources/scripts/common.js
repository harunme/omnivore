"use strict";function handleBackendUrl(e){try{return[/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/,/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu\.be|piped\.video))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/].some((n=>n.test(e)))}catch(n){console.log("error checking url",e)}return!1}function getStorage(e){return new Promise((n=>{browserApi.storage.local.get(e||null,(e=>{n(e||{})}))}))}function getStorageItem(e){return new Promise((n=>{browserApi.storage.local.get(e,(r=>{const o=r&&r[e]||null;n(o)}))}))}function setStorage(e){return new Promise((n=>{browserApi.storage.local.set(e,n)}))}function removeStorage(e){return new Promise((n=>{browserApi.storage.local.remove(e,n)}))}window.browserApi="object"==typeof chrome&&chrome&&chrome.runtime&&chrome||"object"==typeof browser&&browser||{},window.browserActionApi=browserApi.action||browserApi.browserAction||browserApi.pageAction,window.browserScriptingApi=browserApi.scripting||browserApi.tabs,window.ENV_EXTENSION_ORIGIN=browserApi.runtime.getURL("PATH/").replace("/PATH/",""),window.ENV_IS_FIREFOX=ENV_EXTENSION_ORIGIN.startsWith("moz-extension://"),window.ENV_IS_EDGE=navigator.userAgent.toLowerCase().indexOf("edg")>-1,window.ENV_DOES_NOT_SUPPORT_BLOB_URL_ACCESS=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),window.SELECTORS={CANONICAL_URL:["head > link[rel='canonical']"],TITLE:["head > meta[property='og:title']"]},window.ACTIONS={Ping:"PING",ShowMessage:"SHOW_MESSAGE",GetContent:"GET_CONTENT",AddIframeContent:"ADD_IFRAME_CONTENT",RefreshDarkMode:"REFRESH_DARK_MODE",GetAuthToken:"GET_AUTH_TOKEN",LabelCacheUpdated:"LABEL_CACHE_UPDATED",ShowToolbar:"SHOW_TOOLBAR",UpdateStatus:"UPDATE_STATUS",AddNote:"ADD_NOTE",EditTitle:"EDIT_TITLE",SetLabels:"SET_LABELS",Archive:"ARCHIVE",Delete:"DELETE"},window.SAVE_URL_QUERY="mutation SaveUrl ($input: SaveUrlInput!) {\n  saveUrl(input:$input){\n    ... on SaveSuccess {\n      url\n      clientRequestId\n    }\n    ... on SaveError {\n      errorCodes\n    }\n  }\n}",window.SAVE_FILE_QUERY="mutation SaveFile ($input: SaveFileInput!) {\n  saveFile(input:$input){\n    ... on SaveSuccess {\n      url\n      clientRequestId\n    }\n    ... on SaveError {\n      errorCodes\n    }\n  }\n}",window.SAVE_PAGE_QUERY="mutation SavePage ($input: SavePageInput!) {\n  savePage(input:$input){\n    ... on SaveSuccess {\n      url\n      clientRequestId\n    }\n    ... on SaveError {\n      errorCodes\n    }\n  }\n}";