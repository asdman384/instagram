#! /bin/sh
sudo screen -d -m -L node subscribe #&> ./subscribe_log.txt
sudo screen -d -m -L node unsubscribe #&> ./unsubscribe_log.txt
echo "started"
