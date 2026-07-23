const getSocialAccountModel = require('../models/SocialAccount');
const getScheduledPostModel = require('../models/ScheduledPost');
const { encrypt, decrypt } = require('../../../core/utils/encryption');
const metaAdapter = require('./metaAdapter');

// Adapters لكل منصة. Facebook/Instagram تستخدم Meta Graph API الحقيقي (مجاني).
// X (Twitter) لا توفر نشراً مجانياً منذ 2023 (يتطلب خطة مدفوعة) - أبقيناها mock موثّقة بوضوح.
// TikTok/LinkedIn تتطلب مراجعة تطبيق مسبقة من المنصة - mock موثقة أيضاً لحين اعتماد التطبيق.
const platformAdapters = {
  facebook: {
    publish: async (account, post) => {
      const accessToken = decrypt(account.accessTokenEncrypted);
      const res = await metaAdapter.publishToFacebookPage({
        pageId: account.externalAccountId,
        accessToken,
        message: post.content,
        imageUrl: post.mediaUrls?.[0],
      });
      return { externalPostId: res.id || res.post_id };
    },
  },
  instagram: {
    publish: async (account, post) => {
      const accessToken = decrypt(account.accessTokenEncrypted);
      if (!post.mediaUrls?.[0]) {
        throw new Error('Instagram يتطلب صورة واحدة على الأقل لكل منشور');
      }
      const res = await metaAdapter.publishToInstagram({
        igUserId: account.externalAccountId,
        accessToken,
        imageUrl: post.mediaUrls[0],
        caption: post.content,
      });
      return { externalPostId: res.id };
    },
  },
  // ⚠️ لا يوجد API مجاني للنشر على X حالياً - يبقى mock حتى تُفعَّل خطة مدفوعة
  x: { publish: async () => mockPublish('x') },
  // ⚠️ يتطلب TikTok for Developers (مراجعة تطبيق) قبل التفعيل - mock مؤقتاً
  tiktok: { publish: async () => mockPublish('tiktok') },
  linkedin: { publish: async () => mockPublish('linkedin') },
};

async function mockPublish(platform) {
  return { externalPostId: `mock_${platform}_${Date.now()}` };
}

class SocialService {
  constructor(connection) {
    this.Account = getSocialAccountModel(connection);
    this.Post = getScheduledPostModel(connection);
  }

  // ==== الحسابات ====
  async connectAccount({ platform, accountName, externalAccountId, accessToken, refreshToken, expiresAt, ownerId }) {
    return this.Account.create({
      platform,
      accountName,
      externalAccountId,
      accessTokenEncrypted: encrypt(accessToken),
      refreshTokenEncrypted: refreshToken ? encrypt(refreshToken) : undefined,
      tokenExpiresAt: expiresAt,
      ownerId,
    });
  }

  async listAccounts(ownerId) {
    return this.Account.find({ ownerId }).select('-accessTokenEncrypted -refreshTokenEncrypted');
  }

  async revokeAccount(id) {
    return this.Account.findByIdAndUpdate(id, { status: 'revoked' }, { new: true });
  }

  // ==== المنشورات ====
  async schedulePost({ accountId, content, mediaUrls, scheduledFor }) {
    const account = await this.Account.findById(accountId);
    if (!account) throw Object.assign(new Error('الحساب غير موجود'), { status: 404 });

    return this.Post.create({
      accountId,
      platform: account.platform,
      content,
      mediaUrls,
      scheduledFor,
    });
  }

  async listPosts({ status, page = 1, limit = 20 } = {}) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.Post.find(filter).populate('accountId', 'platform accountName').skip(skip).limit(limit).sort({ scheduledFor: 1 }),
      this.Post.countDocuments(filter),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  // تُستدعى من مهمة دورية (cron) تفحص المنشورات المستحقة النشر الآن
  async publishDuePosts() {
    const due = await this.Post.find({ status: 'pending', scheduledFor: { $lte: new Date() } }).populate('accountId');
    const results = [];

    for (const post of due) {
      post.status = 'publishing';
      await post.save();
      try {
        const adapter = platformAdapters[post.platform];
        if (!adapter) throw new Error(`لا يوجد adapter لمنصة ${post.platform}`);
        const { externalPostId } = await adapter.publish(post.accountId, post);
        post.status = 'published';
        post.publishedAt = new Date();
        post.externalPostId = externalPostId;
      } catch (err) {
        post.status = 'failed';
        post.errorMessage = err.message;
      }
      await post.save();
      results.push({ id: post._id, status: post.status });
    }
    return results;
  }
}

module.exports = SocialService;
