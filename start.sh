#! /bin/sh
sudo screen -d -m -L node -r ts-node/register ./demons/follower/follower.ts #&> ./subscribe_log.txt
echo "started"
