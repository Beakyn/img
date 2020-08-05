import { NowRequest, NowResponse } from '@vercel/node'
import sharp from 'sharp';
import * as fetch from 'node-fetch';

export default async (req: NowRequest, res: NowResponse) => {
  const {img, r, w, h, f, pos, bg, we} = req.query

  if (!img) return res.status(400).json({code: 400, error: 'img param with url missing.'})

  /**
   * Normalize params
   */
  const fit = f || 'cover'
  const background = bg ? `#${bg}` : '#00000000'
  const position = String(pos).replace(',', ' ') || 'center'
  const withoutEnlargement = Boolean(we)

  try {
    const fetchResponse = await fetch(img)
    const buffer = await fetchResponse.buffer()

    let sharpResponse = sharp(buffer)

    if (w || h) sharpResponse = sharpResponse.resize(
      Number(w) || undefined,
      Number(h) || undefined,
      {
        fit,
        position,
        background,
        withoutEnlargement,
      }
    );

    if (r) sharpResponse = sharpResponse.rotate(Number(r) || 0, { background })

    sharpResponse = await sharpResponse.png().toBuffer()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')

    res.send(sharpResponse)
  } catch (error) {
    throw new Error(error);
  }
}