import { GET as SocialImageGET } from '@/app/api/social-image/[...filename]/route';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ filename: string[] }> }
) {
  return SocialImageGET(request, context);
}
