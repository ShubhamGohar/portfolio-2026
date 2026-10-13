import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { SANITY_CACHE_TAG } from '@/lib/sanity';

type WebhookPayload = {
  _type?: string;
  _id?: string;
};

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: 'Missing environment variable SANITY_REVALIDATE_SECRET' },
        { status: 500 },
      );
    }

    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      secret,
      true,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    revalidateTag(SANITY_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({
      revalidated: true,
      tag: SANITY_CACHE_TAG,
      type: body?._type ?? null,
      now: Date.now(),
    });
  } catch (err: unknown) {
    console.error('Sanity revalidate webhook failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
