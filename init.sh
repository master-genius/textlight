#!/bin/bash

cd $(dirname "$0")

SITEDIR=website

if [ ! -d "config" ] ; then
    mkdir config
fi

echo '创建站点目录···'
if [ ! -d "$SITEDIR" ] ; then
    mkdir $SITEDIR
fi

SITEDLIST="download log image siteinfo"
for d in $SITEDLIST ; do
    if [ ! -d "$SITEDIR/$d" ] ; then
        mkdir $SITEDIR/$d
    fi
done

echo '建立站点文件···'
SITEF="footer copyright sitename title theme"
for f in $SITEF ; do
    if [ ! -f "$f" ] ; then
        touch $SITEDIR/siteinfo/$f
        if [ $f = "title" ] ; then
            echo "TextLight" > $SITEDIR/siteinfo/$f
        elif [ $f = "copyright" ] ; then
            echo '&copy; <a href="https://www.w3xm.cn" target="_blank">道简网络科技</a>' > $SITEDIR/siteinfo/$f
        elif [ $f = "theme" ] ; then
            echo -n 'default' > $SITEDIR/siteinfo/$f
        fi
    fi
done

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

if [ ! -f "config/dblock" ] ; then
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

if [ ! -f "config/config.js" ] ; then
    cp cfg-example/config.js config/config.js
fi

echo '如果要修改连接配置，可以编辑config/dbconfig.js'

echo '创建root用户···'
node createuser.js
