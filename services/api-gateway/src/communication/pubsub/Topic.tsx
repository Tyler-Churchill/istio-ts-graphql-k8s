// import { PubSub, CreateTopicResponse } from '@google-cloud/pubsub';

// interface ITopic {
//   topicName: string;
//   subscriptionName?: string;
//   subscription?: any;
// } //cloud beta emulators pubsub start

// class Topic implements ITopic {
//   topicName: string;
//   subscriptionName?: string;
//   pubSub: PubSub;
//   subscription?: any;

//   constructor(topicName: string, subscriptionName?: string) {
//     this.pubSub = new PubSub({
//       projectId: 'riiborn12312' // TODO add to secret
//     });
//     this.topicName = topicName;
//     this.subscriptionName = subscriptionName;
//     try {
//       if (subscriptionName) {
//         this.pubSub.createTopic(this.topicName).then((topic: any) => {
//           topic.createSubscription(subscriptionName);
//         });
//       } else {
//         this.pubSub.createTopic(this.topicName);
//       }
//     } catch (_) {
//       // topic or subscription already exists
//     }
//   }

//   async publish(data: any) {
//     await this.pubSub.topic(this.topicName).publish(data);
//   }

//   async subscribe(onMessage: any) {
//     const topic = this.pubSub.topic(this.topicName)
//     this.subscription = await topic.subscription.(this.subscriptionName, {
//       autoCreate: true,
//       flowControl: {
//         maxBytes: 10000,
//         maxMessages: 5,
//       },
//     })
//     this.subscription.on('message', onMessage)
//   }
// }

// interface IEventData {
//   topic: Topic;
//   data: any;
//   timestamp: string;
// }
