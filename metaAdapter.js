const { request } = require('../../../core/utils/httpClient');

/**
 * Meta Graph API (Facebook Pages + Instagram) - الاستدعاء مجاني تماماً
 * يحتاج فقط: تطبيق Meta for Developers (مجاني) + Page Access Token
 * التوثيق: https://developers.facebook.com/docs/graph-api
 */
const GRAPH_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

// ينشر منشور نصي/صورة على صفحة فيسبوك باستخدام Page Access Token المخزّن (بعد فك تشفيره)
async function publishToFacebookPage({ pageId, accessToken, message, imageUrl }) {
  if (imageUrl) {
    return request({
      method: 'POST',
      url: `${BASE_URL}/${pageId}/photos`,
      data: { url: imageUrl, caption: message, access_token: accessToken },
    });
  }
  return request({
    method: 'POST',
    url: `${BASE_URL}/${pageId}/feed`,
    data: { message, access_token: accessToken },
  });
}

// ينشر على حساب Instagram Business (يتطلب ربطه بصفحة فيسبوك مسبقاً - نفس المتطلب في توثيق Meta)
async function publishToInstagram({ igUserId, accessToken, imageUrl, caption }) {
  const container = await request({
    method: 'POST',
    url: `${BASE_URL}/${igUserId}/media`,
    data: { image_url: imageUrl, caption, access_token: accessToken },
  });
  return request({
    method: 'POST',
    url: `${BASE_URL}/${igUserId}/media_publish`,
    data: { creation_id: container.id, access_token: accessToken },
  });
}

// يجلب إحصائيات منشور منشور فعلياً (لتحديث metrics في ScheduledPost)
async function fetchPostInsights({ postId, accessToken }) {
  return request({
    method: 'GET',
    url: `${BASE_URL}/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`,
  });
}

module.exports = { publishToFacebookPage, publishToInstagram, fetchPostInsights };
