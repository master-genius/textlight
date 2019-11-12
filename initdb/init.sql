CREATE TABLE IF NOT EXISTS admin(id varchar(40) primary key default '', username varchar(32) not null default '', passwd varchar(255) not null default '', email varchar(50) not null default '', role varchar(16) not null default 'editor', login_ip varchar(100) not null default '', salt varchar(16) not null default '', forbid smallint not null default 0);

create index on admin using hash(username);

CREATE TABLE IF NOT EXISTS users(id varchar(40) primary key default '', username varchar(32) not null default '', passwd varchar(255) not null default '', email varchar(50) not null default '', nickname varchar(50) not null default '', signature varchar(100) not null default '', regtime timestamp);


create index on users using hash(username);

create index on users using hash(email);

CREATE TABLE IF NOT EXISTS docs(id varchar(40) primary key, title varchar(100) not null default '', content text not null default '', keywords varchar(30), adminid varchar(40) not null default '', adminname varchar(50) not null default '', doctype varchar(16) not null default 'rich-text', tags varchar(50) not null default '', is_public smallint not null default 0, ctype varchar(16) not null default 'news', digest varchar(255) not null default '', gid integer not null default 0,addtime timestamp, updatetime timestamp, iswarnning smallint not null default 0, warnning varchar(100) not null default '', is_hidden smallint not null default 0, is_delete smallint not null default 0, is_top smallint not null default 0, version bigint not null default 0);


create index on docs using hash(is_public);

create index on docs using hash(is_hidden);

CREATE TABLE IF NOT EXISTS docgroup (id serial primary key, grpname varchar(32) not null default '', parent_id integer not null default 0);