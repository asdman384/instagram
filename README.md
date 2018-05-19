# instagram

1. curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y mc
   sudo apt-get install -y git
   sudo apt-get install -y htop
2. sudo git clone https://github.com/asdman384/instagram.git   
3. add ip to google cloud sql
    Go to cloud.google.com
    Go to my Console
    Choose you Project.
    Choose Networking > VPC network
    Choose "Firewalls rules"
    Choose Create Firewall Rule
    To allow incoming TCP port 8081-83, in "Protocols and Ports" enter tcp:8081;tcp:8082;tcp:8083;
4. sudo npm install
5. node 
6. start.sh
7. sudo screen -d -m -L node -r ts-node/register ~/instagram/demons/auther/auth.ts
7. sudo screen -d -m -L node -r ts-node/register ~/instagram/demons/subscriber/subscriber.ts
