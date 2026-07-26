import { neon } from '@neondatabase/serverless';
const sql = neon(process.argv[2]);
const c = await sql`select conname, pg_get_constraintdef(oid) def from pg_constraint where conrelid='public.users'::regclass order by conname`;
console.log('CONSTRAINTS:');
for (const r of c) console.log('  ' + r.conname + ' :: ' + r.def);
const i = await sql`select indexname, indexdef from pg_indexes where schemaname='public' and tablename='users' order by indexname`;
console.log('\nINDEXES:');
for (const r of i) console.log('  ' + r.indexdef);
