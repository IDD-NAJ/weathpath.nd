import { neon } from '@neondatabase/serverless';
const sql = neon(process.argv[2]);
const t = await sql`select table_name from information_schema.tables where table_schema='public' order by 1`;
console.log('TABLES:', t.length ? t.map(r=>r.table_name).join(', ') : '(none)');
if (t.some(r=>r.table_name==='users')) {
  const c = await sql`select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='users' order by ordinal_position`;
  console.log('\nusers columns:');
  for (const r of c) console.log('  ' + r.column_name.padEnd(20), r.data_type.padEnd(26), 'null=' + r.is_nullable, r.column_default ? 'def=' + String(r.column_default).slice(0,40) : '');
  const n = await sql`select count(*)::int n from users`;
  console.log('  row count:', n[0].n);
}
