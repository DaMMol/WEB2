import {GraphQLError} from 'graphql';
import catModel from '../models/catModel';
import {
  Cat,
  LocationInput,
  Location,
  TokenContent,
  User,
} from '../../types/DBTypes';
import mongoose from 'mongoose';
import {MyContext} from '../../types/MyContext';

// TODO: create resolvers based on cat.graphql
// note: when updating or deleting a cat, you need to check if the user is the owner of the cat
// note2: when updating or deleting a cat as admin, you need to check if the user is an admin by checking the role from the user object
// note3: updating and deleting resolvers should be the same for users and admins. Use if statements to check if the user is the owner or an admin

export default {
  Query: {
    catById: async (_parent: undefined, args: {id: string}) => {
      try {
        const cats = await catModel.find({id: args.id});
        return cats;
      } catch (error) {
        console.log(error);
      }
    },
    cats: async () => {
      return await catModel.find();
    },
    catsByArea: async (
      _parent: undefined,
      args: {topRight: Location; bottomLeft: Location},
    ) => {
      try {
        const cats = await catModel.find({
          'location.coordinates.0': {
            $gte: args.bottomLeft.lat,
            $lte: args.topRight.lat,
          },
          'location.coordinates.1': {
            $gte: args.bottomLeft.lng,
            $lte: args.topRight.lng,
          },
        });
        return cats;
      } catch (error) {
        console.log(error);
      }
    },
    catsByOwner: async (_parent: undefined, args: {ownerId: string}) => {
      try {
        const cats = await catModel.find({owner: args.ownerId});
        return cats;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    createCat: async (
      _parent: undefined,
      args: {input: Omit<Cat, 'id' | 'owner'>},
      context: MyContext,
    ) => {
      return await catModel.create({
        ...args.input,
        owner: context.userdata?.user,
      });
    },
    updateCat: async (
      _parent: undefined,
      args: {id: string; input: Omit<Cat, 'id' | 'owner' | 'filename'>},
      context: MyContext,
    ) => {
      try {
        const cat = await catModel.findById(args.id);
        if (!cat) {
          throw new Error('Cat not found');
        }
        if (context.userdata?.user.role === 'admin') {
          const updatedcat = await catModel
            .findByIdAndUpdate(args.id, args.input, {
              returnDocument: 'after',
            })
            .populate('owner');
          return updatedcat;
        } else if (String(cat!.owner._id) === context.userdata?.user.id) {
          const updatedcat = await catModel
            .findByIdAndUpdate(args.id, args.input, {
              returnDocument: 'after',
            })
            .populate('owner');
          return updatedcat;
        } else {
          throw new Error('Not the cat owner or an admin');
        }
      } catch (error) {
        console.log(error);
      }
    },
    deleteCat: async (
      _parent: undefined,
      args: {id: string},
      context: MyContext,
    ) => {
      try {
        const cat = await catModel.findById(args.id);
        if (!cat) {
          throw new Error('Cat not found');
        }
        if (context.userdata?.user.role === 'admin') {
          const ripcat = await catModel.findByIdAndDelete(args.id);
          return ripcat;
        } else if (String(cat!.owner._id) === context.userdata?.user.id) {
          const ripcat = await catModel.findByIdAndDelete(args.id);
          return ripcat;
        } else {
          throw new Error('Not the cat owner or an admin');
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
