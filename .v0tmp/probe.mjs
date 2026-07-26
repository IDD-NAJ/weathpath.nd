import { neon } from '@neondatabase/serverless';
const raw = process.argv[2];
const fixed = raw.replace('channel_binding=requirev','channel_binding=require');
for (const [label, url] of [['AS-GIVEN', raw], ['CORRECTED', fixed]]) {
  try {
    const sql = neon(url);
    const r = await sql`select current_database() db, current_user usr`;
    console.log(label + ': OK ->', r[0].db, '/', r[0].usr);
  } catch (e) {
    console.log(label + ': FAIL ->', e.message);
  }
}
