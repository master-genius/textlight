#!/bin/bash

cd $(dirname "$0")

if [ ! -d "config" ] ; then
    mkdir config
fi

DBNAME=textlight
DBUSER=textlight
DBOK=
DBHOST='127.0.0.1'

initDbSql () {
    if [ ! -f "config/dblock" ] ; then
        echo '正在初始化数据库···（init database···）'
        psql -U "$DBUSER" -d "$DBNAME" < initdb/init.sql && echo 'ok' > config/dblock && DBOK='ok'
    else
        echo '数据库已经初始化'
    fi
}

if [ ! -a "config/dblock" ] ; then
    echo '请输入数据库用户名，默认：textlight'
    read DBUSER
    if [[ -z "$DBUSER" ]] ; then
        DBUSER=textlight
    fi

    echo '请输入数据库名称，默认：textlight '
    read DBNAME
    if [ -z "$DBNAME" ] ; then
        DBNAME=textlight
    fi

    echo '数据库连接密码：'
    read DBPASS

    initDbSql
    if [ "$DBOK" = "ok" ] ; then
        echo "数据库创建完成"
    else
        echo "数据库初始化失败，请检查数据库配置等情况"
        exit 1
    fi

    echo '创建数据库连接配置文件···'
    DBCFG="module.exports = {\n
        host : '$DBHOST',\n
        port : 5432,\n
        user : '$DBUSER',\n
        database : '$DBNAME',\n
        password : '$DBPASS',\n
        max: 8,\n
    };"

    echo -e $DBCFG > config/dbconfig.js
fi

if [ ! -a "config/config.js" ] ; then
    cp cfg-example/config-example.js config/config.js
fi

echo '如果要修改连接配置，可以编辑config/dbconfig.js'

echo '创建root用户···'
node createuser.js
