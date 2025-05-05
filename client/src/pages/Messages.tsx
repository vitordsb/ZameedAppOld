import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Send, ChevronLeft, Plus, FileEdit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'wouter';
import { useMessaging, Conversation } from '@/hooks/use-messaging';
import { ContractDialog, ContractData } from '@/components/ContractDialog';
import { ContractMessage } from '@/components/ContractMessage';

export default function Messages() {
  const { user, isLoggedIn } = useAuth();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialUserId = searchParams.get('userId');
  
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'detail'>(initialUserId ? 'detail' : 'list');
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [contracts, setContracts] = useState<Array<{
    id: string;
    serviceDescription: string;
    price: number;
    terms: string;
    status: 'pending' | 'accepted' | 'rejected' | 'paid';
    createdAt: Date;
    isFromCurrentUser: boolean;
  }>>([]);
  
  const {
    conversations,
    currentConversation,
    messages,
    newMessage,
    loadingConversations,
    loadingMessages,
    loadingInitialPartner: loadingInitialUser,
    sendingMessage,
    setNewMessage,
    sendMessage: handleSendMessage,
    selectConversation: selectConversationBase,
    startConversation: startConversationBase,
    // Other functions from the hook that we're not using directly here
  } = useMessaging(initialUserId);

  // Handle contract creation
  const handleSubmitContract = async (contractData: ContractData) => {
    if (!currentConversation) return;
    
    // In a real app, this would be an API call to create a contract
    // For now, we'll simulate it by adding to our local state
    const newContract = {
      id: `contract-${Date.now()}`,
      ...contractData,
      status: 'pending' as const,
      createdAt: new Date(),
      isFromCurrentUser: true
    };
    
    setContracts(prev => [...prev, newContract]);
    
    // Also send a regular message about the contract
    setNewMessage(`I've sent you a contract proposal for $${contractData.price} - ${contractData.serviceDescription}`);
    await handleSendMessage();
  };
  
  // Simulate accepting a contract
  const handleAcceptContract = async (contractId: string) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'accepted' as const } 
          : contract
      )
    );
    
    // Send a message indicating acceptance
    setNewMessage("I've accepted your contract proposal. Let's proceed!");
    await handleSendMessage();
    
    return Promise.resolve();
  };
  
  // Simulate rejecting a contract
  const handleRejectContract = async (contractId: string) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'rejected' as const } 
          : contract
      )
    );
    
    // Send a message indicating rejection
    setNewMessage("I've declined your contract proposal. Let's discuss further.");
    await handleSendMessage();
    
    return Promise.resolve();
  };
  
  // Simulate paying for a contract
  const handlePayContract = async (contractId: string) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'paid' as const } 
          : contract
      )
    );
    
    // Send a message indicating payment
    setNewMessage("I've processed the payment for our contract. Looking forward to working together!");
    await handleSendMessage();
    
    return Promise.resolve();
  };

  // Process message input for contract keyword
  useEffect(() => {
    if (newMessage.toLowerCase().includes("contract please")) {
      // When the user types "Contract please", send the message as is
      handleSendMessage();
      
      // Simulate receiving a contract after a delay
      setTimeout(() => {
        if (currentConversation) {
          // Add a simulated contract from the designer
          const designerContract = {
            id: `contract-designer-${Date.now()}`,
            serviceDescription: "Interior Design Consultation and Implementation",
            price: 2500,
            terms: "50% payment upfront\n25% after design approval\n25% upon completion\nDelivery in 4 weeks\nUp to 3 revisions included",
            status: 'pending' as const,
            createdAt: new Date(),
            isFromCurrentUser: false
          };
          
          setContracts(prev => [...prev, designerContract]);
          
          // We don't directly modify the messages array - instead, we'd rely on 
          // the server to send back this message, but in this demo we're just 
          // simulating that everything worked
        }
      }, 1500);
    }
  }, [newMessage, currentConversation, handleSendMessage]);

  const selectConversation = (conversation: Conversation) => {
    selectConversationBase(conversation);
    setMobileViewMode('detail');
  };

  const handleBackToList = () => {
    setMobileViewMode('list');
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your messages</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access your messages</p>
          <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col mt-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="flex flex-row border rounded-lg overflow-hidden h-[calc(100vh-250px)] bg-background">
          {/* Conversations List - Hidden on mobile when viewing messages */}
          <div className={`w-full md:w-1/3 border-r ${mobileViewMode === 'detail' ? 'hidden md:block' : 'block'}`}>
            <div className="p-4 border-b bg-card">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => window.location.href = '/home?showDesigners=true'}
                >
                  <Plus className="h-4 w-4" />
                  <span>Browse</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 flex-1"
                  onClick={() => {
                    // Create a test conversation with Emma Rodriguez (Designer 1)
                    startConversationBase(1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Chat Emma</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 flex-1"
                  onClick={() => {
                    // Create a test conversation with Jack Wilson (Designer 2)
                    startConversationBase(2);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Chat Jack</span>
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-320px)]">
              {loadingConversations ? (
                <div className="flex justify-center items-center h-full py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Messages from designers and clients will appear here</p>
                </div>
              ) : (
                <div>
                  {conversations.map(conversation => (
                    <div 
                      key={conversation.partner.id} 
                      className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                        currentConversation?.partner.id === conversation.partner.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                          <AvatarImage src={conversation.partner.profileImage || undefined} alt={conversation.partner.name} />
                          <AvatarFallback>{getInitials(conversation.partner.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{conversation.partner.name}</h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {formatRelativeTime(conversation.lastMessage.createdAt.toString())}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.isFromUser ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center text-xs flex-shrink-0">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Message Thread - Full width on mobile when viewing */}
          <div className={`w-full md:w-2/3 flex flex-col ${mobileViewMode === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {loadingInitialUser ? (
              <div className="flex flex-col justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading conversation...</p>
              </div>
            ) : currentConversation ? (
              <>
                <div className="p-4 border-b bg-card flex items-center">
                  {mobileViewMode === 'detail' && (
                    <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-2 md:hidden">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarImage 
                      src={currentConversation.partner.profileImage || undefined} 
                      alt={currentConversation.partner.name} 
                    />
                    <AvatarFallback>{getInitials(currentConversation.partner.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">{currentConversation.partner.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {currentConversation.partner.userType === 'designer' ? 'Designer' : 'Client'}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-full py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-full text-muted-foreground py-10">
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Start the conversation by sending a message</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Regular messages */}
                        {messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.senderId === user.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-accent'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className="text-xs mt-1 text-right">
                                {formatRelativeTime(message.createdAt.toString())}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Contract messages */}
                        {contracts.map(contract => (
                          <div
                            key={contract.id}
                            className={`flex ${contract.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <ContractMessage
                              contract={contract}
                              onAccept={handleAcceptContract}
                              onReject={handleRejectContract}
                              onPay={handlePayContract}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t bg-card mt-auto">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex space-x-2"
                    >
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsContractDialogOpen(true)}
                        disabled={sendingMessage}
                        title="Create a Service Contract"
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                    
                    {/* Contract Dialog */}
                    <ContractDialog
                      open={isContractDialogOpen}
                      onOpenChange={setIsContractDialogOpen}
                      onSubmit={handleSubmitContract}
                      receiverName={currentConversation?.partner.name || ''}
                      isDesigner={currentConversation?.partner.userType === 'designer' ? false : true}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a conversation from the list to view messages or start a new one by contacting a designer or client.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}